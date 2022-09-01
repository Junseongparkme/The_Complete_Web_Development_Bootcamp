const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

main().catch((err) => console.log(err));

async function main() {
  await mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
    })
    .then(() => console.log('connected'));

  const itemSchema = {
    name: String,
  };

  const Item = mongoose.model('Item', itemSchema);

  const item1 = new Item({
    name: 'Welcome to your todo list.',
  });

  const item2 = new Item({
    name: 'Hit the + button to add a new item.',
  });

  const item3 = new Item({
    name: '<-- Hit this to delete an item.',
  });

  const defaultItems = [item1, item2, item3];

  const listSchema = {
    name: String,
    items: [itemSchema],
  };

  const List = mongoose.model('List', listSchema);

  app.get('/', function (req, res) {
    Item.find(function (err, foundItems) {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function (err) {
          if (err) console.log(err);
          else {
            console.log('Successfully inserted default items');
          }
        });
        res.redirect('/');
      } else {
        res.render('list', { listTitle: 'Today', newListItems: foundItems });
      }
    });
  });

  app.post('/', function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    console.log(itemName, listName);

    let item = new Item({
      name: itemName,
    });

    if (listName === 'Today') {
      item.save();
      res.redirect('/');
    } else {
      List.findOne({ name: listName }, function (err, foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect('/' + listName);
      });
    }
  });

  app.post('/delete', function (req, res) {
    let checkedItemId = req.body.checkbox;
    let listName = req.body.listName;

    if (listName === 'Today') {
      Item.findByIdAndRemove(checkedItemId, function (err) {
        if (err) console.log(err);
        else {
          console.log('Successfully removed.');
          res.redirect('/');
        }
      });
    } else {
      List.findOneAndUpdate(
        { name: listName },
        { $pull: { items: { _id: checkedItemId } } },
        function (err, foundList) {
          if (!err) {
            res.redirect('/' + listName);
          }
        }
      );
    }
  });

  app.get('/:customListName', function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, function (err, foundList) {
      if (err) console.log(err);
      else if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect('/' + customListName);
      } else {
        res.render('list', {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    });

    const list = new List({
      name: customListName,
      items: defaultItems,
    });

    list.save();
  });
}
const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`Server started on port ${port}`);
});
