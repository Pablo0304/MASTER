#include <stdio.h>
#include <math.h>

double f( double a ) {
    return (4.0 / (1.0 + a*a));
}

int main( int argc, char *argv[])
{
    int done = 0, n, i;
    double PI25DT = 3.141592653589793238462643;
    double pi, h, sum, x;
    char processor_name[80];

    gethostname(processor_name);
    fprintf(stderr,"Proceso en %s\n", processor_name);

    n = 0;
    {
        n = atoi(argv[1]);

        if (n == 0)
            done = 1;
        else
        {
            h   = 1.0 / (double) n;
            sum = 0.0;
            for (i =  1; i <= n; i++)
            {
                x = h * ((double)i - 0.5);
                sum += f(x);
            }
            pi = h * sum;

           fprintf(stdout,"pi es aprox. %.16f (%d intervalos), Error es %.16f\n",
                       pi, n, fabs(pi - PI25DT));
        }
    }
    return 0;
}

