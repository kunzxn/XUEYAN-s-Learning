using System.Data;
public interface ILibraryRepository {
 Task<object> Words(Actor actor);
 Task Save(Actor actor,long wordId);
 Task Remove(Actor actor,long wordId);
}
public sealed class LibraryRepository(Database database):ILibraryRepository {
 public async Task<object> Words(Actor actor){await using var c=await database.Open(actor);return await Database.Query(c,"SELECT Id,Simplified,Pinyin,HanViet,MeaningVi,MeaningEn FROM learning.MySavedWords WHERE UserId=@user ORDER BY Id DESC",("user",actor.UserId));}
 public async Task Save(Actor actor,long wordId){
  await using var c=await database.Open(actor);using var tx=c.BeginTransaction(IsolationLevel.Serializable);
  try{using var command=Database.Command(c,"""
   IF NOT EXISTS(SELECT 1 FROM catalog.PublishedWords WHERE WordId=@word) THROW 51021,'Word unavailable.',1;
   DECLARE @collection bigint=(SELECT CollectionId FROM learning.Collections WITH(UPDLOCK,HOLDLOCK) WHERE UserId=@user AND Name=N'Từ đã lưu');
   IF @collection IS NULL BEGIN INSERT learning.Collections(UserId,Name) VALUES(@user,N'Từ đã lưu'); SET @collection=SCOPE_IDENTITY(); END;
   IF NOT EXISTS(SELECT 1 FROM learning.CollectionWords WITH(UPDLOCK,HOLDLOCK) WHERE CollectionId=@collection AND WordId=@word)
    INSERT learning.CollectionWords(CollectionId,UserId,WordId) VALUES(@collection,@user,@word);
   """,("user",actor.UserId),("word",wordId));command.Transaction=tx;await command.ExecuteNonQueryAsync();tx.Commit();}catch{tx.Rollback();throw;}
 }
 public async Task Remove(Actor actor,long wordId){await using var c=await database.Open(actor);await Database.Execute(c,"DELETE learning.CollectionWords WHERE UserId=@user AND WordId=@word AND CollectionId IN (SELECT CollectionId FROM learning.Collections WHERE UserId=@user AND Name=N'Từ đã lưu')",("user",actor.UserId),("word",wordId));}
}
