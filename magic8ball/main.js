
const App = () => {
    const useState = React.useState;
    const [input, setInput] = useState('');
    const [question, setQuestion] = useState('');
    const [index, setIndex] = useState('');
    const handleChange = (e) => {
        setInput(e.target.value)
    }
    const handleClick = () => {
        if(input){
            setIndex(Math.floor(Math.random() * 20));
            setQuestion(input);
            setInput('');
        }
    }
    const answers = [
        'It is certain',
        'It is decidedly so',
        'Without a doubt', 
        'Yes, definitely',
        'You may rely on it',
        'As I see it, yes',
        'Outlook good',
        'Yes',
        'Signs point to yes',
        'Reply hazy try again',
        'Ask again later',
        'Better not tell you now',
        'Cannot predict now',
        'Concentrate and ask again',
        'Don\'t count on it', 
        'My reply is no',
        'My sources say no',
        'Most likely',
        'Outlook not so good',
        'Very doubtful'
    ]
    return (
        <div className="container">
            <div className="flex-container">
                
                <div className="flex-item" style={{width: "75%",borderRight: "1px solid black", marginRight: "15px"}}>
                    <h1>Magic 8 Ball</h1>
                    <input type="text" value={input} onChange={handleChange} autofocus="true"/>
                    <h3>Question</h3>
                    <p>{question}</p>
                    <h3>Answer</h3>
                    <p>{index !== null && answers[index]}</p>
                </div>
                <div className="flex-item">
                    <div onClick={handleClick} className="button">ask</div>
                </div>
            </div>
        </div>
    )
}

ReactDOM.render(<App />, document.getElementById("app"));