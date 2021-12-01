import React from 'react';
import { Form } from "@/components/react-easy-formcore";


class RenderFrom extends React.Component<RenderFromProps, RenderFromState> {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <Form store={this.store}>
                <Form.Field>
                    
                </Form.Field>
            </Form>
        );
    }
}

export default RenderFrom;
