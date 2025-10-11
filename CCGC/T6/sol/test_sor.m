d = int32(str2num(argv(){1}));
w = double(str2num(argv(){2}));

n = d*d;
mu = 0.01;
v1 = ones(d*d-1,1);
v2 = ones(d*(d-1),1);
A = eye(n)+eye(n)*3*mu + diag(v1,1)*mu + diag(v1,-1)*mu + diag(v2,d)*mu + diag(v2,-d)*mu;
b = zeros(n,1); b(n/2,1)=1;
x0 = zeros(n,1);
it = 0;
salir = 0;

Maxits = 1000;
tol = 1e-8;

while (it<Maxits) & (salir==0)
    for i=1:n
        x(i) = b(i);
        for j=1:i-1
            x(i) = x(i) - A(i,j)*x(j);
        end
        for j=i+1:n
            x(i) = x(i) - A(i,j)*x0(j);
        end
        x(i) = x(i)/A(i,i);
        x(i) = w*x(i) + (1-w)*x0(i);
    end
    if (abs((x(:)-x0(:)))< tol)
        salir = 1;
    end
    it = it +1;
    x0 = x(:);
end
it
