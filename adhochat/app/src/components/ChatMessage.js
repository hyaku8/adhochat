import React from 'react';
import { List, Segment } from 'semantic-ui-react';

export class ChatMessage extends React.Component {

    render() {
        return (
            <List.Item>
                <List.Content style={{ width: '75%' }} floated={this.props.isOwn ? 'right' : 'left'}>
                    <Segment color={this.props.isOwn ? 'green' : 'blue'}>
                        {!this.props.isOwn && <List.Header>{this.props.user.name}</List.Header>}
                        {this.props.content}
                    </Segment>
                </List.Content>
            </List.Item>
        );
    }

}

export default ChatMessage;
