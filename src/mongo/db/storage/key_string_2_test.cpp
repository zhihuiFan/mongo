#define MONGO_LOG_DEFAULT_COMPONENT ::mongo::logger::LogComponent::kStorage

#include "mongo/platform/basic.h"

#include <algorithm>
#include <cmath>
#include <limits>
#include <memory>
#include <random>
#include <typeinfo>
#include <vector>

#include "mongo/base/owned_pointer_vector.h"
#include "mongo/base/simple_string_data_comparator.h"
#include "mongo/bson/bsonobj_comparator.h"
#include "mongo/bson/simple_bsonobj_comparator.h"
#include "mongo/config.h"
#include "mongo/db/storage/key_string.h"
#include "mongo/platform/decimal128.h"
#include "mongo/stdx/functional.h"
#include "mongo/stdx/future.h"
#include "mongo/stdx/memory.h"
#include "mongo/unittest/death_test.h"
#include "mongo/unittest/unittest.h"
#include "mongo/util/hex.h"
#include "mongo/util/log.h"
#include "mongo/util/timer.h"

using std::string;
using namespace mongo;

BSONObj toBson(const KeyString& ks, Ordering ord) {
    return KeyString::toBson(ks.getBuffer(), ks.getSize(), ord, ks.getTypeBits());
}

auto ord = Ordering::make(BSONObj());

TEST(KeyStringTest, V) {
    unsigned char s[4] = {'a', 'c', '\0', 0xff};
    StringData strData((char *)s, 4);
    BSONObj a = BSON("" << strData);
    KeyString _ks(KeyString::Version::V1, a, ord);
    auto bson = toBson(_ks, ord);
    ASSERT_EQ(memcmp(s, bson[""].String().c_str(), 4), 0);
}
