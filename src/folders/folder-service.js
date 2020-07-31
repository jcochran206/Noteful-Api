const FolderService = {
    getAllFolders(knex){
        
        return knex.select('*').from('noteful_folders')
    },
    insertFolder(knex, newFolder){
        return knex
        .insert(newFolder)
        .into('noteful_folders')
        .returning('*')
        .then(rows => {
            return rows[0]
        })
    },

    getById(db, id) {
        return db('noteful_folders')
          .select('*')
          .where({ id })
          .first();
      },
    
      deleteFolder(db, id) {
        return db('noteful_folders')
          .where({ id })
          .delete();
      },
    
      updateFolder(db, id, data) {
        return db('noteful_folders')
          .where({ id })
          .update(data);
      }

}

module.exports = FolderService;