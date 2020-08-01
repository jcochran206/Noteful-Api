const express = require('express')
const { isWebUri } = require('valid-url')
const xss = require('xss')
const logger = require('../logger')
const FolderService = require('./folder-service')
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
        logger.info(`Bookmark with id ${folder.id} created.`)
        res
          .status(201)
          .location(`/folders/${folder.id}`)
          .json(serializeFolder(folder))
      })
      .catch(next)
  })

// FolderRouter
//   .route('/bookmarks/:bookmark_id')
//   .all((req, res, next) => {
//     const { bookmark_id } = req.params
//     BookmarksService.getById(req.app.get('db'), bookmark_id)
//       .then(bookmark => {
//         if (!bookmark) {
//           logger.error(`Bookmark with id ${bookmark_id} not found.`)
//           return res.status(404).json({
//             error: { message: `Bookmark Not Found` }
//           })
//         }
//         res.bookmark = bookmark
//         next()
//       })
//       .catch(next)
//   })
//   .get((req, res) => {
//     res.json(serializeBookmark(res.bookmark))
//   })
//   .delete((req, res, next) => {
//     const { bookmark_id } = req.params
//     BookmarksService.deleteBookmark(
//       req.app.get('db'),
//       bookmark_id
//     )
//       .then(numRowsAffected => {
//         logger.info(`Bookmark with id ${bookmark_id} deleted.`)
//         res.status(204).end()
//       })
//       .catch(next)
//   })

module.exports = FolderRouter