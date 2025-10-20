#!/bin/bash
# Lanzamiento de los trabajos
rm -r proc_ids.txt
NUM_JOBS=$1
JOB=0
LINE=1
while [ $JOB -lt $NUM_JOBS ]
do
  RES=`sed -n ${LINE}p recursos`
 echo globusrun -b -r ${RES} -f script_$JOB.rsl
 globusrun -b -r $RES -f script_$JOB.rsl | grep http >> proc_ids.txt
  JOB=$((  JOB+1 ))
 LINE=$(( LINE+1 ))
done
