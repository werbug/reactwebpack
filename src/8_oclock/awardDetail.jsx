import React from 'react';

import './style/award_detail.less';

class AwardDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            img_url: this.props.location.state.img_url,
            name: this.props.location.state.name
        };
    }
    
    /*
    _close() {
        this.props.history.replace('/');
    }
    */
    
    render() {
        return (
            <div className="body">
                <section className="award_detail">
                    <img src={this.state.img_url}/>
                    <p>{this.state.name}</p>
                </section>
            </div>
        );
    }
    
    
}


export default AwardDetail;