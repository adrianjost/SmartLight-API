async function testRequest(string) {
	const url =
		"http://localhost:5000/smartlight-4861d/us-central1/iftttSpeach/set";
	const data = {
		uid: "IcAd2hRhBoRs5WTORWTTCSaRSvy2",
		secret:
			"yZ69YTfZfUz5DTnpEsnvq6X6MYHCq2XsrrVZb54865YuDpm9F7WmxYXAp62QVYe5Bhrm73Wq2Ycd6eNrXpcgv4C3NY38DweQHtLCCwNtYzqfbWxYwDbSVLLqr2SnQARXbH8TLuT5c3TLTAXG2eSW7vmtz9p5S6NCL4Cc2FyXQuuwh83bdcvDvpsGpXZYEgYL6HZAQ3sx6TyNb8EgRwLb7rFYNuy5LDABDbWcrsqpMtQnhhWcngZ6yPTu7xFCPZVpPEhzyQPHeGCnzvRLYFddH7MQvcnr3uLNwthqm3UxtEAwsWwFd5zs8hrp2nM3tphYRPX6DVZbGNQLBfHWYDHCvP2QRbn7fBGvpXghc2zLXzRX6xVmp5y7rz2VzsEcG5zZ2pGGYVgDSAcUXY5eHVBY3DNhmmgLqGvWBU46RbWq5VthxWWwv5TeDgTVBpXwxnmw75buN8NGc8DYD9Ubb9r3V6ah3ydFDEm6xtRm6rYxZvvbCXEnaHrpYzWQpBSFbYZn",
		textString: string,
	};
	let response = await fetch(url, {
		method: "POST",
		cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
		headers: {
			"Content-Type": "application/json; charset=utf-8",
		},
		redirect: "follow",
		body: JSON.stringify(data),
	});
	if (response.ok) {
		await response.text();
		return true;
	} else {
		return response.statusText;
	}
}

function showStatus(id, status, body, error) {
	const content = `${status ? "✔" : "✘"} - ${JSON.stringify(body)} - ${error}`;
	let para = document.createElement("p");
	if (status) {
		para.setAttribute("style", "color: teal;");
	} else {
		para.setAttribute("style", "background-color: #ea3e44; color: white;");
		console.error(content);
	}
	let node = document.createTextNode(content);
	let paraNum = document.createElement("span");
	let nodeNum = document.createTextNode(id);
	paraNum.appendChild(nodeNum);
	para.appendChild(paraNum);
	para.appendChild(node);

	let element = document.getElementById("log");
	element.appendChild(para);
}

function test() {
	console.log("run test...");
	//"Hey Google, Licht ... machen"
	//"Hey Google, mache das Licht ..."
	const testStrings = [
		"von Acht grün",
		"vom Acht rot",
		"im Acht orange",
		"am Acht lila",
		"an Acht lila",
		"vom Acht lila",
		"von unserm Acht blau",
		"vom unserem Acht türkis",
		"vom unserem Acht lila bitte",
		"vom unserem Acht pink bitte",
		"vom Acht bitte gelb",
		"vom Acht bitte 10% dunkler",
		"vom Acht bitte 40 Prozent dunkler",
		"vom Acht bitte 90% heller",
		"vom Acht bitte viel heller",
		"AN in unserem Acht",
		"AUS im Acht",
	];
	let requests = testStrings.map(async (string) => {
		return await testRequest(string);
	});
	return Promise.all(requests).then((results) => {
		let index = 0;
		results.forEach((result) => {
			showStatus(
				index + 1,
				result === true,
				testStrings[index],
				result === true ? "" : result
			);
			index += 1;
		});
		return true;
	});
}

document.addEventListener("DOMContentLoaded", test, false);
