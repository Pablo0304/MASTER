NUM_JOBS=$1
procesos=$1
JOB=0
LINE=1
while [ $procesos -gt 0 ]; do
  while [ $JOB -lt $NUM_JOBS ]
  do
    id=`head -${LINE} proc_ids.txt | tail -1`
    echo 'Analizando proceso' ${id}
    if [ `globus-job-status ${id}` = "DONE" ]; then
      procesos=$((procesos-1))
    fi
    LINE=$(( LINE+1 ))
    JOB=$((  JOB+1 ))
  done
  echo .Pendientes: $procesos esperamos 30 segundos
  sleep 30
done
