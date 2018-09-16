import React from 'react';
import { Form, Button } from 'semantic-ui-react'

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
            <Form onSubmit={this.handleSubmit}>
                <Form.Input value={this.state.message} onChange={this.handleChange}
                    fluid action={<Button type='submit' primary>Send</Button>} />
            </Form>
        );
    }

}

export default MessageInput;
