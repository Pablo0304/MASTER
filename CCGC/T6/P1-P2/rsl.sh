#!/bin/bash
GASS_PORT=37413
LOCAL_HOST=pgoncab.ccgc.mucnap.upv.es
NUMBER_W=$1

i=0
while [ $i -lt $NUMBER_W ]
do
 echo "&" >script_$i.rsl
 echo "(count = 1)" >> script_$i.rsl
 echo "(executable = /usr/bin/octave)" >> script_$i.rsl
 echo "(arguments = -q test_sor.m 10 1.${i} )" >> script_$i.rsl
 echo "(rsl_substitution = (GASS_URL https://$LOCAL_HOST:${GASS_PORT}/home/ccgc/Evidencias/Grid/04_Programacion/P2))" >> script_$i.rsl
 echo "(stdout = \$(GASS_URL)/miStdout_${i})" >> script_$i.rsl
 echo "(stderr = \$(GASS_URL)/miStderr_${i})" >> script_$i.rsl
 echo "(file_stage_in=( \$(GASS_URL)/test_sor.m test_sor.m ) )" >> script_$i.rsl
 echo "(file_stage_out=(miStdout_${i} \$(GASS_URL)/miStdout_${i}) )" >> script_$i.rsl
 i=$(( i+1 ))
done