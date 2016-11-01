module.exports = {
  servers: {
    one: {
      host: '104.236.58.225',
      username: 'root',

      // password:
      // or leave blank for authenticate from ssh-agent
    }
  },

  setupMongo: true,
  setupNode: true,
  nodeVersion: '4.4.7',
  setupPhantom: true,

  meteor: {
    name: 'pixinsta',
    path: '.',
    servers: {
      one: {}
    },
    dockerImage: 'abernix/meteord:base',
    buildOptions: {
      serverOnly: true,
    },
    env: {
      ROOT_URL: 'http://104.236.58.225',
      MONGO_URL: 'mongodb://localhost/meteor'
    },

    //dockerImage: 'kadirahq/meteord'
    deployCheckWaitTime: 60
  },

  mongo: {
    oplog: true,
    port: 27017,
    servers: {
      one: {},
    },
  },
};