const cors = require("./cors");
describe("api/middleware/cors", () => {
	const getContext = () => [{}, { header: () => {} }, () => {}];

	it("each request has cors headers set", () => {
		const context = getContext();
		const spy = jest.spyOn(context[1], "header");
		cors(...context);
		expect(spy).toHaveBeenCalledWith("Access-Control-Allow-Origin", "*");
		expect(spy).toHaveBeenCalledWith(
			"Access-Control-Allow-Headers",
			"Origin, X-Requested-With, Content-Type, Accept"
		);
	});

	it("next is called", () => {
		const context = getContext();
		const spy = jest.spyOn(context, 2);
		cors(...context);
		expect(spy).toHaveBeenCalled();
	});
});
