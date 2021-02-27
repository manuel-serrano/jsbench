#!/bin/sh
#*=====================================================================*/
#*    serrano/prgm/project/hop/jsbench/tools/mem.sh                    */
#*    -------------------------------------------------------------    */
#*    Author      :  Manuel Serrano                                    */
#*    Creation    :  Sat Feb 27 06:03:00 2021                          */
#*    Last change :  Sat Feb 27 06:03:01 2021 (serrano)                */
#*    Copyright   :  2021 Manuel Serrano                               */
#*    -------------------------------------------------------------    */
#*    Show the memory usage of a running process                       */
#*=====================================================================*/

# example ./pmapall ./a.out
processname=$1

if [ "$processname " = " " ]; then
  echo "usage: mem process-name"
  exit 1
fi

pid=`ps aux | grep "[0-9] $processname" | awk '{print $2}'`

if [ "$pid " = " " ]; then
  echo "*** ERROR: Cannot find process \"$processname\""
  exit 1
else
  pmap=`pmap $pid | tail -n 1 | awk '{print $2}'`
fi  

sizes=`ps -eo pid,sz,vsz,rss | grep "^[ ]*$pid "`

sz=`echo $sizes | awk '{print $1}'`
vsz=`echo $sizes | awk '{print $2}'`
rss=`echo $sizes | awk '{print $3}'`

# RSS is the Resident Set Size and is used to show how much memory is
# allocated to that process and is in RAM. It does not include memory
# that is swapped out. It does include memory from shared libraries as
# long as the pages from those libraries are actually in memory. It does
# include all stack and heap memory.
# 
# VSZ is the Virtual Memory Size. It includes all memory that the
# process can access, including memory that is swapped out, memory that
# is allocated, but not used, and memory that is from shared libraries.
echo "pmap=$pmap rss=`expr $rss / 1024` ($rss) vsz=`expr $vsz / 1024` ($vsz) sz=`expr $sz / 1024` ($sz)"
