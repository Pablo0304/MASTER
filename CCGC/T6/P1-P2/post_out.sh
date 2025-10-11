tail -1 miStdout_0 >> aux.txt
maximo=`sed -e 's/it =//' aux.txt`
echo max=${maximo}
w=0
for id in 0 1 2 3 4 5 6 7 8 9 ; do
        rm aux.txt
        tail -1 miStdout_${id} >> aux.txt
        valor=`sed -e 's/it =//' aux.txt`
        echo max=${maximo}
        echo val=${valor}
        if [ ${valor} -lt ${maximo} ]; then
                maximo=${valor}
                w=${id}
                echo 'cambio:' ${maximo}
fi done
echo 'optimo = ' ${w}
echo '   con ' ${maximo} ' iteraciones '
rm aux.txt
