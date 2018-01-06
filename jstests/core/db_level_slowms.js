(function() {
    "use strict";

    let SlowDB = db.getSiblingDB('slowdb20171229');
    assert.commandWorked(SlowDB.dropDatabase());
    SlowDB.setProfilingLevel(1, 0)
        assert(SlowDB.system.profile.count() < 2, "db.system.profile is not empty as the beginging")

            for (let i = 0; i < 10; i++) {
        SlowDB.test.save({i: i})
    }
    assert(SlowDB.system.profile.count() >= 10, "no all the test failed")

        let QuickDB =
            db.getSiblingDB('quickdb20171229') assert.commandWorked(QuickDB.dropDatabase());
    QuickDB.setProfilingLevel(1, 10000) assert(QuickDB.system.profile.count() < 2,
                                               "db.system.profile is not empty as the beginging")

        for (let i = 0; i < 10; i++) {
        QuickDB.test.save({i: i})
    }
    assert(QuickDB.system.profile.count() < 2, "Impossible that the db is so slow")
})()
