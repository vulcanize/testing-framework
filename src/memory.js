const uuid = require('uuid');

const store = {};

module.exports = {
  get(id) {
    return store[id] || null;
  },
  set(id, value) {
    store[id] = value;
  },
  save(value) {
    const id = uuid.v4();
    store[id] = value;
    return id;
  }
}