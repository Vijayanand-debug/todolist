const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/todolistDB',{useNewUrlParser: true, useUnifiedTopology: true,useFindAndModify:false});

//Schema for the default home route. 
const itemsSchema= new mongoose.Schema({

      name: {
          type: String,
          required: true,
          minlength: 3  
      }
});

const Item= mongoose.model('Item',itemsSchema);

//Schema for the custom list route.
const customList= new mongoose.Schema({

        title: String,
        itemsList: [itemsSchema]
});

const dList= mongoose.model('dList',customList);  //dynamicList-dLists
let errorText="";

app.get("/",function(req,res){
       Item.find({},function(err,docs){
                         if(docs){
                                  res.render('list',{listTitle:"Home Page",newListItems:docs,errorText:errorText});
                               }
                               else{
                                res.render('list',{listTitle:"Home Page",newListItems:defaultList,errorText:errorText});
                                res.redirect("/");
                               } 
        });
});

app.post("/",function(req,res){
   const newItems=(req.body.newItem);
   const route=(req.body.list);
  
 //To remove the validation error message
   setTimeout(function(){
                  errorText=""},2000);
 
 //creating a dynamic document.
          const item= new Item({
                 name: newItems
           }); 
if(route==="Home Page"){
           item.save(function(err){
                     if(err){
                             errorText="Task cannot be less than 3 Characters";
                     }}); 
           res.redirect("/");
 }else{
         //creating a dynamic document for custom lists
          dList.findOne({title:route},function(err,docs){
              if(!docs){
               const customItem= new dList({
                                      title: route,
                                       itemsList: {          
                                      name: newItems           
                                      }                         
                               });
                              customLists.push(customItem);
                              customItem.save(function(err){
                                                       if(err){
                                                             errorText="Task cannot be less than 3 Characters";
                               }}); 
                res.redirect("/"+route);
               }
             else{
                  docs.itemsList.push(item);
                  docs.save(function(err){
                                       if(err){
                                              errorText="Task cannot be less than 3 Characters";
                  }}); 
                  res.redirect("/"+route);
                 }
           });
      }
});

app.post("/delete",function(req,res){
     const deleteItemId= (req.body.checked);
      const listName=(req.body.listName);
      if( listName==="Home Page"){ 
                      Item.findByIdAndDelete({_id:deleteItemId},function(err){
                           if(err){console.log(err);}
                                 res.redirect("/"); 
                       });
       }else{
             dList.findOneAndUpdate({title:listName},{$pull:{itemsList:{_id:deleteItemId}}},function(err,foundList){
                         if(!err){
                                   res.redirect("/"+listName);     
                         }
             });
       }
});

app.get("/:customRoute",function(req,res){
        customListName=_.capitalize(req.params.customRoute);
        dList.findOne({title:customListName},function(err,docs){
                          if(docs){
                              res.render('list',{listTitle:customListName,newListItems:docs.itemsList,errorText:errorText});
                           }
                          else{
                               res.render('list',{listTitle:customListName,newListItems:[],errorText:errorText});
                          }       
                    });  
});
let port= process.env.PORT;
if(port==null || port==""){
        port=3000;
}
app.listen(port, function() {
  console.log("Server has started Successfully");
});


