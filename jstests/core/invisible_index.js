(function() {
  "use strict";
  let invisibledb = db.getSiblingDB('invisibleIdx')
  let mytab = invisibledb.mytab
  assert.commandWorked(invisibledb.dropDatabase())
  for(var i = 0; i<10000; i++) {
    mytab.save({a: i})
  }
  mytab.createIndex({a: 1})
  assert.eq("a_1",mytab.find({a: 1000}).explain().queryPlanner.winningPlan.inputStage.indexName, "Optimizer doesn't choose a right index")
  invisibledb.runCommand({"collMod": "mytab", "index": {"name": "a_1", "invisible": true}})
  assert.eq("COLLSCAN", mytab.find({a: 1000}).explain().queryPlanner.winningPlan.stage, "Invisible Index doesn't work")
  invisibledb.runCommand({"collMod": "mytab", "index": {"name": "a_1", "invisible": false}})
  assert.eq("a_1",mytab.find({a: 1000}).explain().queryPlanner.winningPlan.inputStage.indexName, "Optimizer doesn't choose a right index")
})()
