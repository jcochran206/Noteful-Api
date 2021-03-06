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