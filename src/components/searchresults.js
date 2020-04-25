import React, {Component} from 'react'
import DataTable from './table'

class SearchTable extends Component{
    render() {
        const headings = [
            'Category',
            'Delivered',
            'Undelivered',
            'Undeliverable',
        ];

        const rows = [
            ['Unregistered Letters', '0', '0', '0',],
            ['Registered Letters', '0', '0', '0',],
            ['Parcels', '0', '0', '0',],
            ['Money Orderes', '0', '0', '0',],
        ];

        return (
            <div>
                <h2 class='tableheading'>Sent and received mail for your address within the last 30 days:</h2>
                <h2 class='tablecaption'>Sent Mail</h2>
                <DataTable headings = {headings} rows = {rows} />
                <h2 class='tablecaption'>Received Mail</h2>
                <DataTable headings = {headings} rows = {rows} />
            </div>
        )
    }
}

export default SearchTable