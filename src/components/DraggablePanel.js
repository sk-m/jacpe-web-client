import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { createDraggableComponentFromType } from "../tools";
import { config_assign_component } from "../actions";

class DraggablePanel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // TODO: @css Add dragOver styles
            dragOver: false,
            empty: true,
            child_components: []
        }

        this.onDragEnter = this.onDragEnter.bind(this);
        this.onDragLeave = this.onDragLeave.bind(this);
        this.onDragOver = this.onDragOver.bind(this);
        this.onDrop = this.onDrop.bind(this);
    }

    shouldComponentUpdate(next_props, next_state) {
        // Empty
        if(next_state.empty !== this.state.empty) return true;

        // On child_components update (happens when a panel changes in `config` redux store)
        if(next_state.child_components !== this.state.child_components) return true;

        // Check if the panel changed in `config` redux store
        if(
            next_props.store_config.panels[this.props.panel_id] !== this.props.store_config.panels[this.props.panel_id]
        ) return true;

        return false;
    }

    componentDidUpdate(prev_props) {
        // To make things a bit less messy
        const store_panel = this.props.store_config.panels[this.props.panel_id];

        // Panel config changed
        if(prev_props.store_config.panels[this.props.panel_id] !== store_panel) {
            // Get all child_components for this panel
            const l = store_panel.child_components.length;

            // If the panel is empty
            if(l === 0) {
                this.setState({ empty: true });
                return;
            }

            const child_components = [];

            for(let i = 0; i < l; i++) {
                const component_id = store_panel.child_components[i];

                child_components.push(this.props.store_config.components[component_id].element);
            }

            this.setState({ child_components, empty: false });
        }
    }

    onDragEnter(e) {
        this.setState({ dragOver: true });

        e.preventDefault();
        return true;
    }

    onDragLeave(e) {
        this.setState({ dragOver: false });

        e.preventDefault();
        return true;
    }

    onDragOver(e) {
        e.preventDefault();
    }

    onDrop(e) {
        // Get the component type from dataTransfer
        const component_type = e.dataTransfer.getData("text");

        // Create a new component from type
        const new_component = createDraggableComponentFromType(component_type, this.props.panel_id);

        // Check if the new component was reutrned (the function above returns false on error)
        if(new_component) {
            // Assign component to panel in redux store (which will cause this panel to rerender with a new component)
            config_assign_component(new_component, this.props.store_config.panels[this.props.panel_id],
            this.props.dispatch);
        }

        this.setState({ dragOver: false });

        e.stopPropagation();
        return false;
    }

    render() {
        return (
            <div
            className={
                "draggable-panel" +
                (this.state.dragOver ? " drag-over" : "") +
                (this.state.empty ? " empty" : "")
            }
            panel_id={ this.props.panel_id }

            onDragEnter={ this.onDragEnter }
            onDragLeave={ this.onDragLeave }
            onDrop={ this.onDrop }
            onDragOver={ this.onDragOver }
            >
                { this.state.child_components }

                { this.state.empty && <div className="center-text">This panel is empty</div> }

                <div className="panel-buttons">
                    <div className="button"><i className="fas fa-sliders-h"></i></div>
                    <div className="button red"><i className="fas fa-times"></i></div>
                </div>
            </div>
        );
    }
}

DraggablePanel.propTypes = {
    panel_id: PropTypes.string.isRequired,

    store_config: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired
}

function mapStateToProps(state) {
    return { store_config: state.config };
}

export default connect(mapStateToProps)(DraggablePanel);
