import React from 'react';
import { Form } from "@/components/react-easy-formcore";
import { RenderFromProps, RenderFromState } from './types';


class RenderFrom extends React.Component<RenderFromProps, RenderFromState> {
    constructor(props: RenderFromProps) {
        super(props);
        this.state = {
        };
        this.getFormList = this.getFormList.bind(this);
    }

    
    // generateTree = () => {
    //     return treeList.map(({ children, ...props }) => (
    //         <Form.Field>
    //             {this.generateTree(children)}
    //         </Form.Field>
    //     ));
    // };


    // getFormList() {
    //     const { schema } = this.props;
    //     Object.entries(schema.properties)
    // }



    render() {
        const { type, ...rest } = this.props?.schema;
        return (
            <Form store={this.props.store}>
                <Form.Field>

                </Form.Field>
            </Form>
        );
    }
}

export default RenderFrom;
