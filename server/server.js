const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const port = 3000;

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');

const options = {
  swaggerDefinition: {
      info: {
          title: 'Agents Finder API',
          version: '1.0.0',
          descrition: 'API to access agents data'
      },
      host: 'localhost:3000',
      basePath: '/'
  },
  apis: ['./server.js']
};

const specs = swaggerJsdoc(options);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(cors());

const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host:'localhost',
    user:'root',
    password:'root',
    database: 'sample',
    port: 3306,
    connectionLimit: 5
});

/**
 * @swagger
 * /agents:
 *    get: 
 *       description: Return all agents
 *       produces:
 *          - application/json
 *       responses:
 *          200:
 *              description: Object containing array of all agents and their details
 * 
 *    post: 
 *       description: Update all parameters of an agent based on agent_code
 *       parameters:
 *        - in: body
 *          schema:
 *            type: object
 *            required: 
 *              - agent_code
 *            properties:
 *              working_area: 
 *                type: string
 *              agent_name: 
 *                type: string
 *              commission: 
 *                type: string
 *              phone_no: 
 *                type: string
 *              country: 
 *                type: string
 *       produces:
 *          - application/json
 *       responses:
 *          200:
 *              description: Updates all parameters for the agent corresponding to agent_code and returns a success message
 * 
 * /agents?agentcode={agentcode}:
 *    get: 
 *       description: Return agent corresponding to the agent code
 *       produces:
 *          - application/json
 *       responses:
 *          200:
 *              description: Object containing array of all agenets and their details corresponding to the agent code
 * 
 * /agents/workingarea?agentcode={agent_code}:
 *    patch: 
 *       description: Update working_area of an agent based on agent_code
 *       parameters:
 *        - in: body
 *          schema:
 *            type: object
 *            required: 
 *              - working_area
 *            properties:
 *              working_area: 
 *                type: string
 *       produces:
 *          - application/json
 *       responses:
 *          200:
 *              description: Updates the working_area for the agent corresponding to agent_code and returns a success message
 * 
 * /agents?agentcode={agent_code}:
 *    put: 
 *       description: Update all parameters of an agent based on agent_code
 *       parameters:
 *        - in: body
 *          schema:
 *            type: object
 *            required: 
 *              - working_area
 *            properties:
 *              working_area: 
 *                type: string
 *       produces:
 *          - application/json
 *       responses:
 *          200:
 *              description: Updates all parameters for the agent corresponding to agent_code and returns a success message
 *    delete: 
 *       description: Delete an agent based on agent_code
 *       parameters:
 *        - in: query
 *          schema:
 *            type: string
 *            required: 
 *              - agent_code
 *       produces:
 *          - application/json
 *       responses:
 *          200:
 *              description: Updates all parameters for the agent corresponding to agent_code and returns a success message
 */

app.get('/agents', (req, res) => {
  const agent_code = req.query?.agentcode;
  if (agent_code == null || agent_code == ''){
    pool.getConnection()
    .then(conn => {
      conn.query("SELECT * from agents")
        .then((result) => {
          console.log(result);
          res.json(result);    
          conn.end();
        })
        .catch(err => {
          console.log(err); 
          conn.end();
        })
        
    }).catch(err => {
      console.log(err);
    });
  }
  else {
    pool.getConnection()
    .then(conn => {
      conn.query(`SELECT * from agents where agent_code='${agent_code}'`)
        .then((result) => {
          console.log(result);
          res.json(result);    
          conn.end();
        })
        .catch(err => {
          console.log(err); 
          conn.end();
        })
        
    }).catch(err => {
      console.log(err);
    });
  }
});


//update working area based on agent code
app.patch('/agents/workingarea', bodyParser.json(), (req, res) => {
  var agent_code = req.query?.agentcode;
  if (agent_code == null || agent_code == ''){
    res.send("Invalid agent code");
  }
  else{
    pool.getConnection()
    .then(conn => {
      conn.query(`SELECT * from agents where agent_code='${agent_code}'`)
          .then((result) => {
            if(result==''){
              console.log("Error: Agent does not exist");
              res.json({'Error': 'Agent does not exist'});
              conn.end();
            }
            else{
              const {working_area} = req.body;
              if(working_area != null){
                conn.query(`UPDATE agents SET WORKING_AREA='${working_area}' where AGENT_CODE='${agent_code}'`)
                  .then(() => {
                    res.json({"Status": "Successfully updated working area"});
                    console.log("Status: Successfully updated working area");
                    conn.end();
                })
                .catch(err => {
                  console.log(err);
                })
              }
              else{
                console.log("Error: Invalid body param. working_area required");
                res.json({'Error': 'Invalid body param. working_area required'});
              }
            }
          })
          .catch(err => {
            console.log(err); 
            conn.end();
          })
    })
  }
});


//updates all the fields based on agent code. rewrites the entire object
app.put('/agents', bodyParser.json(), (req, res) => {
  var agent_code = req.query?.agentcode;
  if (agent_code == null || agent_code == ''){
    res.send("Invalid agent code");
  }
  else{
    pool.getConnection()
    .then(conn => {
      conn.query(`SELECT * from agents where agent_code='${agent_code}'`)
          .then((result) => {
            if(result==''){
              console.log("Error: Agent does not exist");
              res.json({'Error': 'Agent does not exist'});
              conn.end();
            }
            else{
              const {agent_name, working_area, commission, phone_no, country} = req.body;
                conn.query(`UPDATE agents SET agent_name='${agent_name}', working_area='${working_area}', commission='${commission}', phone_no='${phone_no}', country='${country}' where AGENT_CODE='${agent_code}'`)
                  .then(() => {
                    res.json({"Status": "Successfully updated"});
                    console.log("Status: Successfully updated");
                    conn.end();
                })
                .catch(err => {
                  console.log(err);
                })
            }
          })
          .catch(err => {
            console.log(err); 
            conn.end();
          })
    })
  }
});

//create a new agent
app.post('/agents', bodyParser.json(), (req,res) => {
  const {agent_code, agent_name, working_area, commission,phone_no,country} = req.body;
  if(agent_code == null){
    res.json({"Error": "agent_code cannot be empty"});
  }
  else {
    pool.getConnection()
    .then(conn => {
      conn.query(`SELECT * from agents where agent_code='${agent_code}'`)
        .then((result) => {
          if(result!=''){
            console.log("Error: An entry with the same agent_code exists");
            res.json({"Error": "An entry with the same agent_code exists"});
            conn.end();
          }
          else{
            conn.query(`INSERT INTO agents (agent_code, agent_name, working_area, commission, phone_no, country) VALUES ('${agent_code}', '${agent_name}', '${working_area}', '${commission}', '${phone_no}', '${country}')`)
            .then((result) => {
              console.log(result);
              res.json({"Status":"Insert Success"});    
              conn.end();
            })
            .catch(err => {
              console.log(err); 
              conn.end();
            })  
          }
        })
        .catch(err => {
          consol.log(err);
        })
        
    }).catch(err => {
      console.log(err);
    });
  }
});

//delete an agent based on agent code
app.delete('/agents', bodyParser.json(),(req,res) => {
  const agent_code = req.query?.agentcode;
  console.log(agent_code);
  if(agent_code == null || agent_code == '') {
    console.log(agent_code);
    res.json({"Error": "Invalid agent code"});
  }
  else{
    pool.getConnection()
      .then(conn => {
          conn.query(`DELETE from agents WHERE AGENT_CODE='${agent_code}'`)
              .then((result) => {
                  console.log(result.affectedRows);
                  if(result.affectedRows == 0){
                    res.json({"Error": "No entry found with the given agent_code"});
                  }
                  else{
                    res.json({"Status": "Delete Success"});
                  }
                  conn.end();
              })
              .catch(err => {
                  console.log(err);
                  conn.end();
              })
      }).catch(err => {
          console.log(err);
      });
  }
});


//get all students data
app.get('/student', (req, res) => {
    pool.getConnection()
    .then(conn => {
      conn.query("SELECT * from student")
        .then((result) => {
          console.log(result);
          res.json(result);    
          conn.end();
        })
        .catch(err => {
          console.log(err); 
          conn.end();
        })
        
    }).catch(err => {
      console.log(err);
    });
});

app.post('/student', bodyParser.json(), (req,res) => {
    const {name, title, className, section,rollid} = req.body;
    pool.getConnection()
    .then(conn => {
      conn.query(`INSERT INTO student (NAME, TITLE, CLASS, SECTION, ROLLID) VALUES ('${name}', '${title}', '${className}', '${section}', '${rollid}')`)
        .then((result) => {
          console.log(result);
          res.json({"Status":"Insert Success"});    
          conn.end();
        })
        .catch(err => {
          console.log(err); 
          conn.end();
        })
        
    }).catch(err => {
      console.log(err);
    });
});

app.put('/student/update/section', bodyParser.json(), (req,res) => {
    const {section, rollid} = req.body;
    pool.getConnection()
        .then(conn => {
            conn.query(`UPDATE student SET SECTION='${section}' where ROLLID='${rollid}'`)
                .then((result) => {
                    console.log(result);
                    res.json({"Status": "Update Success"});
                    conn.end();
                })
                .catch(err => {
                    console.log(err);
                    conn.end();
                })
        }).catch(err => {
            console.log(err);
        });
});

app.delete('/student', bodyParser.json(),(req,res) => {
    const{rollid} = req.body;
    pool.getConnection()
        .then(conn => {
            conn.query(`DELETE from student WHERE ROLLID='${rollid}'`)
                .then((result) => {
                    console.log(result);
                    res.json({"Status": "Delete Success"});
                    conn.end();
                })
                .catch(err => {
                    console.log(err);
                    conn.end();
                })
        }).catch(err => {
            console.log(err);
        });
});

app.get('/say', (req,res) => {
  const keyword = req.query?.keyword;
  console.log(keyword);
  axios.get(`https://piy8au10fi.execute-api.us-east-2.amazonaws.com/test/say?keyword=${keyword}`)
    .then((response)=>{
      res.send(response.data);
    })
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
