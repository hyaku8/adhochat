import React from 'react';
import { Modal, Form, Menu, Icon, Button } from 'semantic-ui-react'

export class JoinChatModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = { show: false, value: '' };

        this.handleSubmit = this.handleSubmit.bind(this);

    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.joinChat(this.state.value);
        this.setState({ value: '', show: false });
    }

    render() {
        return (
            <Modal open={this.state.show} size='tiny'
                onClose={() => { this.setState({ show: false }); }}
                trigger={<Menu.Item
                    as='a'
                    name='joinChat'
                    onClick={() => { this.setState({ show: true }); }}
                    content={<div><Icon name='arrow circle right' /> Join chat</div>}
                />}>
                <Modal.Header>Enter chat code</Modal.Header>
                <Modal.Content>
                    <Form onSubmit={this.handleSubmit} >
                        <Form.Input value={this.state.value}
                            onChange={(e) => { this.setState({ value: e.target.value }) }}
                            fluid action={<Button type='submit' primary>Join</Button>} />
                    </Form>
                </Modal.Content>
            </Modal>
        );
    }

}
