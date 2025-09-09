async function callApiLoadUserSettings(serverURL, userID) {
  const url = serverURL + "/api/loadUserSettings";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userID: userID
      })
    });
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    console.log("User settings: ", body);
    var parsed = JSON.parse(body.express);
    //var parsed = [{ mode: 1}];
    return parsed;
}

export default callApiLoadUserSettings;