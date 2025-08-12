/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2385511666")

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1110990446",
    "max": 0,
    "min": 0,
    "name": "reporting_period",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "number106610454",
    "max": null,
    "min": null,
    "name": "total_employees",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "number2053934951",
    "max": null,
    "min": null,
    "name": "benefit_eligible_faculty",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number1272990947",
    "max": null,
    "min": null,
    "name": "benefit_eligible_staff",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "number613067084",
    "max": null,
    "min": null,
    "name": "non_benefit_eligible_faculty",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "number1275588673",
    "max": null,
    "min": null,
    "name": "non_benefit_eligible_staff",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "number446071043",
    "max": null,
    "min": null,
    "name": "total_students",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "number1204388304",
    "max": null,
    "min": null,
    "name": "vacancy_rate",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "number1462449055",
    "max": null,
    "min": null,
    "name": "new_hires",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "number3465163051",
    "max": null,
    "min": null,
    "name": "terminations",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "json4249045969",
    "maxSize": 0,
    "name": "location_breakdown",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "json1932134886",
    "maxSize": 0,
    "name": "demographics",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "json587233555",
    "maxSize": 0,
    "name": "additional_metrics",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2385511666")

  // remove field
  collection.fields.removeById("text1110990446")

  // remove field
  collection.fields.removeById("number106610454")

  // remove field
  collection.fields.removeById("number2053934951")

  // remove field
  collection.fields.removeById("number1272990947")

  // remove field
  collection.fields.removeById("number613067084")

  // remove field
  collection.fields.removeById("number1275588673")

  // remove field
  collection.fields.removeById("number446071043")

  // remove field
  collection.fields.removeById("number1204388304")

  // remove field
  collection.fields.removeById("number1462449055")

  // remove field
  collection.fields.removeById("number3465163051")

  // remove field
  collection.fields.removeById("json4249045969")

  // remove field
  collection.fields.removeById("json1932134886")

  // remove field
  collection.fields.removeById("json587233555")

  return app.save(collection)
})
