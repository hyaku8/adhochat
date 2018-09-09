import React from 'react';

export class MessageInput extends React.Component {

    constructor(props) {
        super(props);
        this.state = { message: '' };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({ message: event.target.value });
    }

    handleSubmit(event) {
        event.preventDefault();
        const message = this.state.message;
        this.props.onNewMessage(this.props.chat.id, message);
        this.setState({ message: '' });
    }


    render() {
        return (
            <form onSubmit={this.handleSubmit} >
                <label>Message: </label>
                <input type="text" name="message" value={this.state.message} onChange={this.handleChange} />
                <input type="submit" value="Send" />
            </form>
        );
    }

}

export default MessageInput;
