"use client";

import { useEffect, useState } from "react";

export default function Countdown() {

  const targetDate = new Date("2026-09-01T00:00:00");

  const calculate = () => {

    const now = new Date();

    const diff = targetDate.getTime() - now.getTime();

    if (diff <= 0) {

      return {
        days:0,
        hours:0,
        minutes:0,
        seconds:0
      }

    }

    return {

      days:Math.floor(diff/(1000*60*60*24)),

      hours:Math.floor((diff/(1000*60*60))%24),

      minutes:Math.floor((diff/(1000*60))%60),

      seconds:Math.floor((diff/1000)%60),

    }

  }

  const [time,setTime]=useState(calculate());

  useEffect(()=>{

      const interval=setInterval(()=>{

          setTime(calculate());

      },1000);

      return ()=>clearInterval(interval);

  },[]);

  return(

      <div
      style={{
          display:"flex",
          justifyContent:"center",
          gap:"25px",
          marginTop:"70px",
          flexWrap:"wrap"
      }}
      >

          <Box value={time.days} label="Days"/>

          <Box value={time.hours} label="Hours"/>

          <Box value={time.minutes} label="Minutes"/>

          <Box value={time.seconds} label="Seconds"/>

      </div>

  )

}

function Box({value,label}:{value:number,label:string}){

    return(

        <div
        style={{
            background:"rgba(255,255,255,.12)",
            backdropFilter:"blur(18px)",
            borderRadius:"20px",
            padding:"22px 30px",
            minWidth:"110px",
            color:"#fff"
        }}
        >

            <div
            style={{
                fontSize:"42px",
                fontWeight:700
            }}
            >
                {value}
            </div>

            <div
            style={{
                marginTop:"8px",
                color:"#D4AF37",
                letterSpacing:"3px",
                fontSize:"13px",
                textTransform:"uppercase"
            }}
            >
                {label}
            </div>

        </div>

    )

}