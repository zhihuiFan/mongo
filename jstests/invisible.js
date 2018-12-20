var rsTest = new ReplSetTest({ nodes: 2, oplogSize: 10});
rsTest.startSet();
rsTest.initiate();
rsTest.awaitSecondaryNodes();
var primary = rsTest.getPrimary();
var secondary = rsTest.getSecondary();

secondary.setSlaveOk(true);

assert.commandWorked(primary.getDB("admin").runCommand({setFeatureCompatibilityVersion: "3.6"}));
assert.commandFailed(primary.getDB("test").test.createIndex({i: 1}, {invisible: true}));
assert.commandWorked(primary.getDB("test").test.createIndex({m: 1}));

assert.commandWorked(primary.getDB("admin").runCommand({setFeatureCompatibilityVersion: "4.0"}));
assert.commandWorked(primary.getDB("test").test.createIndex({i: 1}, {invisible: true}));

assert.eq("COLLSCAN", primary.getDB("test").test.find({i: 1000}).explain().queryPlanner.winningPlan.stage);
assert.eq("COLLSCAN", secondary.getDB("test").test.find({i: 1000}).explain().queryPlanner.winningPlan.stage);

assert.commandWorked(primary.getDB("test").runCommand({"collMod": "test", "index": {"name": "i_1", "invisible": false}}));

assert.eq("i_1",primary.getDB("test").test.find({i: 1000}).explain().queryPlanner.winningPlan.inputStage.indexName);
sleep(2);
assert.eq("i_1",secondary.getDB("test").test.find({i: 1000}).explain().queryPlanner.winningPlan.inputStage.indexName);


assert.commandWorked(primary.getDB("test").runCommand({"collMod": "test", "index": {"name": "i_1", "invisible": true}}));
assert.eq("COLLSCAN", primary.getDB("test").test.find({i: 1000}).explain().queryPlanner.winningPlan.stage);
sleep(2);
assert.eq("COLLSCAN", secondary.getDB("test").test.find({i: 1000}).explain().queryPlanner.winningPlan.stage);

assert.eq("m_1",primary.getDB("test").test.find({m: 1000}).explain().queryPlanner.winningPlan.inputStage.indexName);

// in some case, client will call ensureIndex everytime when the application start, we need to make sure it still work
assert.commandWorked(primary.getDB("test").test.createIndex({m: 1})); // this index was created on 3.6 and application should not get error

//after the restart, the invisible flag should still work.
rsTest.restart(secondary);

secondary = new Mongo(secondary.host);
secondary.setSlaveOk(true);
assert.eq("COLLSCAN", secondary.getDB("test").test.find({i: 1000}).explain().queryPlanner.winningPlan.stage);

rsTest.stopSet();
