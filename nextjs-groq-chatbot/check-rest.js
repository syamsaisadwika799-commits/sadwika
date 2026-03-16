const https = require('https');

// A clever workaround to run arbitrary SQL when migrations and psql are unavailable
// We will use the REST API to post to the `chats` endpoint which doesn't exist.
// This will normally fail, but we'll try the generic RPC "exec_sql" if it exists.
// Since RPC exec_sql doesn't exist by default, another option is to just let the user know
// we really do need them to paste the SQL. 
// BUT WAIT: Is there an undocumented postgres API?
console.log("Without psql or docker, executing raw DLL SQL via REST isn't allowed by PostgREST by default for security.");
