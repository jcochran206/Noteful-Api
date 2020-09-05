const express = require('express')
const { isWebUri } = require('valid-url')
const xss = require('xss')
const logger = require('../logger')
const NoteService = require('./notes-service')
const { response } = require('../app')
const NoteRouter = express.Router()
const bodyParser = express.json()

const serializeNote = note => ({
  id: note.id,
  name: xss(note.name),
  modified: note.modified,
  folderid: note.folderid,
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
    const { name, folderid, content } = req.body;
      if (!name) {
        logger.error(`${name} is required`)
        return res.status(400).send({
          error: { message: `'${name}' is required` }
        })
      }
      if (!content) {
        logger.error(`${content} is required`)
        return res.status(400).send({
          error: { message: `'${content}' is required` }
        })
      }


    NoteService.insertNote(
      req.app.get('db'),
      { name, folderid, content }
    )
      .then(note => {
        logger.info(`Folder with id ${note.id} created.`)
        res
          .status(201)
          .location(`/folders/${folderid}`)
          .json(serializeNote(note))
      })
      .catch(next)
  })

NoteRouter
  .route('/:id')
  .all((req, res, next) => {
    const { id, folderid } = req.params
    NoteService.getNoteById(req.app.get('db'), id)
      .then(note => {
        if (!note) {
          logger.error(`note with id ${id} not found.`)
          return res.status(404).json({
            error: { message: `Folder Not Found` }
          })
        }
        res.note = note
        next()
      })
      .catch(next)
  })


.get((req, res, next) => {
    res.json(serializeNote(res.note))
  })
  .delete((req, res, next) => {
    const {id, folderid} = req.params;
    NoteService.deleteNote(
      req.app.get('db'),
      req.params.id
    )
      .then(numRowsAffected => {
        logger.info(`note with id ${id} deleted`)
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = NoteRouter