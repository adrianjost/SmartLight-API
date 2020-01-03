module.exports = async (req, res, next) => {
	const userid = req.headers["authorization-userid"] || req.body.userid;
	if (!userid) {
		res.status(400);
		return res.send(`no uid given`);
	}
	const token = req.headers["authorization-token"] || req.body.token;
	if (!token) {
		res.status(400);
		return res.send(`no auth token given`);
	}
	req.auth = {
		userid,
		token,
	};

	next();
};
