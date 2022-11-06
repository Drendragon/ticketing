import Link from "next/link";

const Index = ({currentUser, tickets}) => {

    const ticketList = tickets.map(ticket => {
        return (
            <tr key={ticket.id}>
                <td>
                    {ticket.title}
                </td>
                <td>
                    {ticket.price}
                </td>
                <td>
                    <Link href="/tickets/[ticketId]"
                          as={`/tickets/${ticket.id}`}>
                        <a className="link-info">Open</a>
                    </Link>
                </td>
            </tr>
        )
    })

    return (
        <div>
            <h1> Tickets </h1>
            <table className="table">
                <thead>
                <tr>
                    <th>
                        Title
                    </th>
                    <th>
                        Price
                    </th>
                    <th>
                        Show
                    </th>
                </tr>
                </thead>
                <tbody>
                {ticketList}
                </tbody>
            </table>
        </div>
    )
}

// SSR side ... sometimes
Index.getInitialProps = async (context, client, currentUser) => {

    const {data} = await client.get('/api/tickets');
    return {
        tickets: data
    }

}

export default Index;


