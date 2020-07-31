const NoteService = {
    getAllNotes(knex){
        return knex.select('*').from('noteful_notes')
    },
    insertNote(knex, newNote){
        return knex
        .insert(newNote)
        .into('noteful_notes')
        .returning('*')
        .then(rows => {
            return rows[0]
        })
    },

    getNoteById(db, id) {
        return db('noteful_notes')
          .select('*')
          .where({ id })
          .first();
      },
    
      deleteNote(db, id) {
        return db('noteful_notes')
          .where({ id })
          .delete();
      },
    
      updateNote(db, id, data) {
        return db('noteful_notes')
          .where({ id })
          .update(data);
      }

}

module.exports = NoteService;