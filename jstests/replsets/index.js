var rst = new ReplSetTest({nodes: 2});
rst.startSet();
rst.initiate();
rst.awaitSecondaryNodes();
var primary = rst.getPrimary();
var secondary = rst.getSecondary();
secondary.setSlaveOk(true);

function verifyIndexSepc(coll) {
    var indexes = coll.getIndices();
    printjson(indexes);
    assert.eq(indexes[1].name, "a_1");
    assert(indexes[1].background)
}

var coll = primary.getDB("test").index_test
coll.createIndex({"a": 1});
sleep(1000);
verifyIndexSepc(coll);
verifyIndexSepc(secondary.getDB("test").index_test);


rst.stopSet();
