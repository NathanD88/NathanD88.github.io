const greenBkg = {
	backgroundColor: "green"
}
//create a component(must be inside a div)
//uses round brackets
const JSX = (
	<div>
		<h1>Hello JSX</h1>
		<h1 style={greenBkg} className="green-bkg">This element has a "green-bkg" class</h1>
	</div>
);

//create a stateless functional component
const MyComponent = function(){
	return (
		<div>
			this is some text
		</div>
	);
};

//render the component
//parameter 1 is the component to render
//parameter 2 is the destination container to render to
ReactDOM.render(MyComponent, document.getElementById("root"));
