const express = require('express')
const { isWebUri } = require('valid-url')
const xss = require('xss')
const logger = require('../logger')
const NoteService = require('./notes-service')
const { response } = require('../app')
const NoteRouter = express.Router()
const bodyParser = express.json()

const serializeFolder = note => ({
  id: note.id,
  name: xss(note.name),
  modified: note.modified,
  folderId: note.folderId,
  content: xss(note.content)
})

NoteRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    NoteService.getAllNotes(knexInstance)
      .then((notes) => {
        res.json(notes)
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


    NoteService.insertFolder(
      req.app.get('db'),
      { name }
    )
      .then(folder => {
        logger.info(`Folder with id ${folder.id} created.`)
        res
          .status(201)
          .location(`/notes/${folder.id}`)
          .json(serializeFolder(folder))
      })
      .catch(next)
  })

NoteRouter
  .route('/:id')
  .all((req, res, next) => {
    const { id } = req.params
    NoteService.getById(req.app.get('db'), id)
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
    NoteService.deleteFolder(
      req.app.get('db'),
      req.params.id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = NoteRouter