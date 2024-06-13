import { NextApiRequest, NextApiResponse } from "next";
import { Stripe } from "stripe";

type Res = {
    session?: Stripe.Checkout.Session;
    message?: string;
}

type LineItem = {
    price: string;
    quantity: number;
}

type Req = {
    lineItems: LineItem[];
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Res>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'POST method required' });
    }

    try {
        const body: Req = req.body;

        if (!body.lineItems || !Array.isArray(body.lineItems) || body.lineItems.length === 0) {
            return res.status(400).json({ message: 'Invalid line items' });
        }

        // Debugging
        console.log('Stripe secret key:', process.env.STRIPE_SECRET);

        const stripe = new Stripe(process.env.STRIPE_SECRET ?? '', {
            apiVersion: '2020-08-27',
        });

        const session = await stripe.checkout.sessions.create({
            success_url: 'http://localhost:3000/success',
            cancel_url: 'http://localhost:3000/cancel',
            line_items: body.lineItems,
            mode: 'payment',
        });

        return res.status(201).json({ session });
    } catch (e: any) {
        console.error('Stripe API error', e);
        return res.status(500).json({ message: e.message });
    }
}
