import React, { Component } from "react";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

class InfoPanelCharacter extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Card sx={{ minWidth: 100 , maxWidth:250}} variant="outlined">
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Character:{this.props.name}<br/>

                    </Typography>
                    <Typography variant="body2" component="div" align="left">
                        Height:{this.props.height}<br />
                        Race:{this.props.race}<br />
                        Hair:{this.props.hair}<br />
                        Realm:{this.props.realm}<br />
                        Wiki:<Link href={this.props.wiki}>
                        {this.props.wiki}</Link>
            
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button size="xsmall">Get Quotes</Button>
                </CardActions>
            </Card>
        );
    }
}

export default InfoPanelCharacter;