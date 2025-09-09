let config = {
  host: 'localhost',
  user: 'nkhchin',
  port: '3306',
  password: 'MSCI245-student',
  database: 'nkhchin'
};
 
export default config;


// run below commands after adding this repo to your priv key
// go to settings -> codespaces -> private key 
// then add this repo to it
// echo "${STUDENT}"
// eval `ssh-agent`
// ssh-add - <<< "${STUDENT}"
// ssh -o ServerAliveInterval=30 -L 3306:localhost:3306 nkhchin@mse-msci-245.uwaterloo.ca