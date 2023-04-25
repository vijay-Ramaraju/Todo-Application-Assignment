///*
const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
var format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
var isValid = require("date-fns/isValid");
//VIJAY */

const dbPath = path.join(__dirname, "todoApplication.db");

/*
const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
var isValid = require("date-fns/isValid");
const app = express();
app.use(express.json());
 
*/

let db;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:/3000/");
    });
  } catch (e) {
    console.log(`DB Error (e.message)`);
  }
};

initializeDBAndServer();

const hasPriorityAndStatus = (requestBody) => {
  return requestBody.priority !== undefined && requestBody.status !== undefined;
};

const hasPriorityProperty = (requestBody) => {
  return requestBody.priority !== undefined;
};

const hasPriorityAndCategory = (requestBody) => {
  return (
    requestBody.priority !== undefined && requestBody.category !== undefined
  );
};

const hasStatusAndCategory = (requestBody) => {
  return requestBody.status !== undefined && requestBody.category !== undefined;
};
const hasStatusProperty = (requestBody) => {
  return requestBody.status !== undefined;
};
const hasCategoryProperty = (requestBody) => {
  return requestBody.category !== undefined;
};

const convertTOResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
    category: dbObject.category,
    dueDate: dbObject.due_date,
  };
};

app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status, category } = request.query;
  let getTodoQuery;
  let data = null;

  //p & S
  switch (true) {
    case hasPriorityAndStatus(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodoQuery = `SELECT 
                    * FROM 
                    todo 
                    WHERE 
                    priority = '${priority}' 
                    AND status =  '${status}';`;
          data = await db.all(getTodoQuery);
          console.log("1 p&S");
          console.log(data);
          response.send(
            data.map((eachOne) => convertTOResponseObject(eachOne))
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    // P & C
    case hasPriorityAndCategory(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          getTodoQuery = `SELECT 
                * FROM 
                todo 
                WHERE priority = '${priority}' 
                AND category =  '${category}';`;
          data = await db.all(getTodoQuery);
          console.log("1 C&P");
          console.log(data);
          response.send(
            data.map((eachOne) => convertTOResponseObject(eachOne))
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasStatusAndCategory(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodoQuery = `SELECT 
                * FROM 
                todo 
                WHERE status = '${status}' 
                AND category =  '${category}';`;
          data = await db.all(getTodoQuery);
          console.log("1 C&S");
          console.log(data);
          response.send(
            data.map((eachOne) => convertTOResponseObject(eachOne))
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case hasPriorityProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        getTodoQuery = `SELECT 
            * FROM 
            todo 
            WHERE todo LIKE '%${search_q}%'
            AND priority = '${priority}';`;
        data = await db.all(getTodoQuery);
        console.log("1 p");
        console.log(data);
        response.send(data.map((eachOne) => convertTOResponseObject(eachOne)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case hasStatusProperty(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        getTodoQuery = `SELECT 
            * FROM 
            todo 
            WHERE todo LIKE '%${search_q}%'
            AND status = '${status}';`;
        data = await db.all(getTodoQuery);
        console.log("1 S");
        console.log(data);
        response.send(data.map((eachOne) => convertTOResponseObject(eachOne)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case hasCategoryProperty(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        getTodoQuery = `SELECT 
        * FROM 
        todo 
        WHERE todo LIKE '%${search_q}%'
        AND category = '${category}';`;
        data = await db.all(getTodoQuery);
        console.log("1 C");
        console.log(data);
        response.send(data.map((eachOne) => convertTOResponseObject(eachOne)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    default:
      getTodoQuery = `SELECT * FROM todo
      WHERE todo LIKE '%${search_q}%';`;
      console.log("1 Default");
      console.log(data);
      data = await db.all(getTodoQuery);
      response.send(data.map((eachOne) => convertTOResponseObject(eachOne)));
  }
});

//API 2 /todos/1/
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT * FROM todo
    WHERE id = ${todoId};`;
  const todoArray = await db.get(getTodoQuery);
  response.send(convertTOResponseObject(todoArray));
});

//API 3 /agenda/

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  console.log(isMatch(date, "yyyy-MM-dd"));
  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    console.log(newDate);
    const requestQuery = `select * from todo where due_date='${newDate}';`;
    const responseResult = await database.all(requestQuery);
    //console.log(responseResult);
    response.send(
      responseResult.map((eachItem) => convertTOResponseObject(eachItem))
    );
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

// API 4 post /todos/ (createTodo)
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const newDate = format(new Date(dueDate), "yyyy-MM-dd");
          const createTodoQuery = `INSERT INTO todo
                (id,todo,priority,status,category,due_date)
                VALUES(${id},'${todo}','${priority}','${status}','${category}','${newDate}');`;
          await db.run(createTodoQuery);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});

//API 5 PUT /todos/:todoId/

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  let updateTodoQuery;
  const getTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const previousData = await db.get(getTodoQuery);
  const {
    todo = previousData.todo,
    status = previousData.status,
    category = previousData.category,
    priority = previousData.priorit,
    dueDate = previousData.dueDate,
  } = request.body;
  switch (true) {
    //Status updated
    case requestBody.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        updateTodoQuery = `UPDATE todo
    SET 
    todo = '${todo}',
    status = '${status}',
    category = '${category}',
    priority = '${priority}',
    due_date = '${dueDate}'
    WHERE id = ${todoId};`;
        await db.run(updateTodoQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    //Category updated
    case requestBody.category !== undefined:
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        updateTodoQuery = `UPDATE todo
    SET 
    todo = '${todo}',
    status = '${status}',
    category = '${category}',
    priority = '${priority}',
    due_date = '${dueDate}'
    WHERE id = ${todoId};`;
        await db.run(updateTodoQuery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    //priority updated
    case requestBody.priority !== undefined:
      if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
        updateTodoQuery = `UPDATE todo
    SET 
    todo = '${todo}',
    status = '${status}',
    category = '${category}',
    priority = '${priority}',
    due_date = '${dueDate}'
    WHERE id = ${todoId};`;
        await db.run(updateTodoQuery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    // todo updated
    case requestBody.todo !== undefined:
      updateTodoQuery = `UPDATE todo
        SET 
        todo = '${todo}',
        status = '${status}',
        category = '${category}',
        priority = '${priority}',
        due_date = '${dueDate}'
        WHERE id = ${todoId};`;
      await db.run(updateTodoQuery);
      response.send("Todo Updated");

      break;
    // dueDate updated
    case requestBody !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newDate = format(new Date(dueDate), "yyyy,MM,dd");
        updateTodoQuery = `UPDATE todo
        SET 
        todo = '${todo}',
        status = '${status}',
        category = '${category}',
        priority = '${priority}',
        due_date = '${dueDate}'
        WHERE id = ${todoId};`;
        await db.run(updateTodoQuery);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
});

//API 6 DELETE /todos/:todoId/
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
DELETE FROM todo WHERE id = ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
