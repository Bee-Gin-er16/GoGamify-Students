const { builtinModules } = require("module");
const Student = require("../models/student");
const User = require("../models/user");

// check internet connection
let isOffline;
require("dns").resolve("www.google.com", function (err) {
  if (err) {
    console.log("No connection");
    isOffline = true;
  } else {
    console.log("Connected");
    isOffline = false;
  }
});

const student_index = (req, res) => {
  console.log("student index");
  if (isOffline) {
    console.log("App is currently running offline...");
    console.log("Cannot retrieve learning resources from DB...");
    res.render("admin/student-accounts", {
      title: "Admin: Student Accounts",
      accounts: [],
      offline: true,
    });
  } else {
    console.log("App is currently running online...");
    console.log("Retrieving learning resources from DB...");
    Student.find()
      .sort({ createdAt: -1 })
      .then((result) => {
        console.log("Number of items: ", result.length);
        console.log("l: ", result.length);
        res.render("admin/student-accounts", {
          title: "Admin: Student Accounts",
          accounts: result,
          offline: false,
        });
      })
      .catch((err) => {
        res.render("404", { title: "Sorry, something went wrong." });
      });
  }
};

const student_post = async (req, res) => {
  console.log("Saving student model...");

  const student = new Student(req.body);
  await student
    .save()
    .then((data) => {
      User.findByIdAndUpdate(
        req.user._id,
        { profile: data._id },
        (err, docs) => {
          if (err) {
            console.log(err);
          } else {
            console.log(docs);
          }
        }
      );

      res.redirect("/home");
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Sorry, something went wrong.",
      });
    });
};

const student_get = async (req, res) => {
  const id = req.params.id;
  console.log(id);
  await Student.findById(id)
    .then((result) => {
      res.render("gamify/details", {
        title: "Learning Resource Details",
        resource: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.render("404", { title: "Sorry, something went wrong." });
    });
};

const student_put = (req, res) => {
  // router.put("/students/:id", function (req, res, next) {
  //   Student.findOneAndUpdate({ _id: req.params.id }, req.body).then(function (
  //     student
  //   ) {
  //     Student.findOne({ _id: req.params.id }).then(function (student) {
  //       res.send(student);
  //     });
  //   });
  // });
  // console.log("put!!");
  // student.findByIdAndUpdate(req.params.id, {
  //   title: req.body.title,
  //   subtitle: req.body.subtitle,
  //   owner: req.body.owner,
  //   active: req.body.active,
  //   body: req.body.body,
  // })
  //   .then((result) => {
  //     res.send("Resource Updated!");
  //   })
  //   .catch((err) => {
  //     console.error(err.message);
  //     res.send(400).send("Server Error");
  //   });
};

const student_delete = async (req, res) => {
  const id = req.params.id;

  await Student.findByIdAndDelete(id)
    .then((result) => {
      res.json({ redirect: "/admin/student-accounts" });
    })
    .catch((err) => {
      res.render("404", { title: "Sorry, something went wrong." });
    });
};

module.exports = {
  student_index,
  student_post,
  student_get,
  student_put,
  student_delete,
};
