kubectl delete -A ValidatingWebhookConfiguration ingress-nginx-admission
kubectl create secret generic jwt-secret --from-literal=jwt=asdf
kubectl create secret generic stripe-secret --from-literal STRIPE_KEY=sk_test_51M0SVeJSmBBOqxb0Qq4zMcZlNbfMD9ILNJnYBy4BexhHKqG7Y4dgMyblYmoB0G3myZyVI2DXXYkLJaoAZWBgyA3U00Rieme3EP
