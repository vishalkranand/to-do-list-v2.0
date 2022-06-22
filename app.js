//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-vkanand:Lovethewayyoulie@cluster0.b7uri.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema(
  {
    name : String 
  }
);

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name : "Go to gym"
});
const item2 = new Item({
  name : "Do your homework"
});
const item3 = new Item ({
  name : "Play cricket"
});

const defaultItems = [item1,item2,item3];

const listSchema ={
  name :String ,
  items : [itemsSchema]
};
const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  

  Item.find({},function(err,items)
  {
    if(items.length===0)
{
  Item.insertMany(defaultItems,function(err)
  {
    if(err)
    {
      console.log(err);
  
    }
    else{
      console.log("Inserted default items successfully");
    }
  });
  res.redirect("/");
}


else
{
    
      res.render("list", {listTitle: "Today", newListItems: items});
}
    
  });
 

});

app.get("/:customListName",function(req,res)
{
const customListName=_.capitalize(req.params.customListName);

List.findOne({name:customListName},function(err,foundlist)
{
  if(!err)
  {
    if(!foundlist)
    {
     //create a new list
     const list = new List({
      name  : customListName ,
      items  : defaultItems,
    });
    list.save();
    res.redirect("/"+customListName);
    }
    else
    {
      //show an existing list
      res.render("list",{listTitle: foundlist.name, newListItems: foundlist.items});
    }
    
  }
});

});


app.post("/", function(req, res){


  const entryFromForm = req.body.newItem;
  const listName = req.body.list ;

 const item = new Item({
  name : entryFromForm
 });

 if(listName === "Today")
 {
  item.save();

  res.redirect("/");
 }

 else {

  List.findOne({name:listName},function(err,foundList)
  {
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });
 }

  
});

app.post("/delete",function(req,res)
{
 
const checkedItem = req.body.checkbox;
const listName = req.body.listName ;
if(listName==="Today")
{
  Item.findByIdAndRemove(checkedItem,function(err)
  {
    if(!err)
    {
    console.log("Successfully deleted checked items");
    res.redirect("/");
    }
  });
 
}
else {
List.findOneAndUpdate({name : listName},{$pull : {items:{_id:checkedItem}}},function(err,foundList)
{
   if(!err)
   {
    res.redirect("/"+listName);
   }
});

}


});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server successfully started on port 3000");
});


