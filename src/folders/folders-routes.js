const express = require('express')
const { isWebUri } = require('valid-url')
const xss = require('xss')
const logger = require('../logger')
const FolderService = require('./folder-service')
const { response } = require('../app')
const FolderRouter = express.Router()
const bodyParser = express.json()

const serializeFolder = folder => ({
  id: folder.id,
  name: xss(folder.name)
})

FolderRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    FolderService.getAllFolders(knexInstance)
      .then((folders) => {
        res.json(folders)
      })
      .catch(next)
  })

  .post(bodyParser, (req, res, next) => {
    const { name } = req.body;
      if (!name) {
        logger.error(`${name} is required`)
        return res.status(400).send({
          error: { message: `'${name}' is required` }
        })
      }


    FolderService.insertFolder(
      req.app.get('db'),
      { name }
    )
      .then(folder => {
        logger.info(`Folder with id ${folder.id} created.`)
        res
          .status(201)
          .location(`/folders/${folder.id}`)
          .json(serializeFolder(folder))
      })
      .catch(next)
  })

FolderRouter
  .route('/:id')
  .all((req, res, next) => {
    const { id } = req.params
    FolderService.getById(req.app.get('db'), id)
      .then(folder => {
        if (!folder) {
          logger.error(`folder with id ${id} not found.`)
          return res.status(404).json({
            error: { message: `Folder Not Found` }
          })
        }
        res.folder = folder
        next()
      })
      .catch(next)
  })

// .get((req, res, next) => {
//     const knexInstance = req.app.get("db");
//     FolderService.getById(knexInstance, req.params.id)
//       .then((folder) => {
//         if (!folder) {
//           logger.error(`Bookmark with id:${req.params.id} not found.`);
//           return res.status(404).json({
//             error: { message: `folder doesn't exist` },
//           });
//         }
//         res.json({
//           ...folder,
//           name: xss(folder.name),
//         });
//       })
//       .catch(next);
//   })

// .delete((req, res, next) => {
//     const { id } = req.params.id;
//     FolderService.deleteFolder(req.app.get('db'), id)
//     .then(rows => {
//         logger.info(`folder with id: ${id} deleted`)
//         res.status(200).send(`folder with id: ${id} deleted`)
//     })
//     .catch(next)
//     // const folderIndex = folder.findIndex(
//     //   (folder) => folder.id === id
//     // );
//     // if (folderIndex === -1) {
//     //   logger.error(`Folder with id:"${id}" not found.`);
//     //   res.status(404).send("Folder not found.");
//     // }
//     // folder.splice(folderIndex, 1);
//     // logger.info(`Folder with id:"${id}" was deleted.`);
//     // res.status(200).send(`Folder with id:"${id}" was deleted.`);
//   })

.get((req, res, next) => {
    res.json(serializeFolder(res.folder))
  })
  .delete((req, res, next) => {
    FolderService.deleteFolder(
      req.app.get('db'),
      req.params.id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = FolderRouter