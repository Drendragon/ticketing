import {useState} from "react";
import useRequest from "../../hooks/use-request";
import {useRouter} from "next/router";

const NewTicket = () => {
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const {doRequest, errors} = useRequest({
        url: '/api/tickets',
        method: 'post',
        body: {
            title, price
        },
        onSuccess: (data) => {
            router.push(`/tickets/${data.id}`);
        }
    })

    const onBlur = () => {
        const value = parseFloat(price);
        if (isNaN(value)) {
            return;
        }
        setPrice(value.toFixed(2));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        doRequest();

    }

    return <div>
        <h1>Create a ticket</h1>
        <form onSubmit={onSubmit}>
            <div className="form-group">
                <label htmlFor="">Title</label>
                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    type="text"
                    className="form-control"/>
            </div>
            <div className="form-group">
                <label htmlFor="">Price</label>
                <input
                    value={price}
                    onBlur={onBlur}
                    onChange={e => setPrice(e.target.value)}
                    type="number"
                    className="form-control"/>
            </div>
            {errors}
            <button className="btn btn-primary">Submit</button>
        </form>
    </div>
}

export default NewTicket;
