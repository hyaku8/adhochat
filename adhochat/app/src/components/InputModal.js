import React from 'react';
import { Modal, Form, Menu, Icon, Button } from 'semantic-ui-react'

export class InputModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = { show: false, value: this.props.value ? this.props.value : '' };

        this.handleSubmit = this.handleSubmit.bind(this);

    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.onSubmit(this.state.value);
        this.setState({ value: '', show: false });
    }

    render() {
        return (
            <Modal open={this.state.show} size='tiny'
                onClose={() => { this.setState({ show: false }); }}
                trigger={<Menu.Item position={this.props.position || ''}
                    as='a'
                    name='joinChat'
                    onClick={() => { this.setState({ show: true }); }}
                    content={<div><Icon name={this.props.icon} />{this.props.menuLabel || this.props.label}</div>}
                />}>
                <Modal.Header>{this.props.label}</Modal.Header>
                <Modal.Content>
                    <Form onSubmit={this.handleSubmit} >
                        <Form.Input value={this.state.value}
                            onChange={(e) => { this.setState({ value: e.target.value }) }}
                            fluid action={<Button type='submit' primary>{this.props.buttonText}</Button>} />
                    </Form>
                </Modal.Content>
            </Modal>
        );
    }

}
