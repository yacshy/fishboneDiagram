<template>
    <defs>
        <!-- tail 渐变色 -->
        <linearGradient id="tail-defs" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:rgba(89,123,190,0.32); stop-opacity:1" />
            <stop offset="100%" style="stop-color:#597BBE; stop-opacity:1" />
        </linearGradient>
        <!-- bubble文字居中 -->
        <path id="bubble-text-defs" d="M0 22, 155 22" />
        <!-- trunk -->
        <linearGradient id="trunk-t-defs" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:rgba(2,12,28,0.58);stop-opacity:0.5" />
            <stop offset="100%" style="stop-color:#3CA1FF;stop-opacity:1" />
        </linearGradient>
        <!-- branch one -->
        <linearGradient id="br-one-lt-defs" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#7FBEF7;stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgba(12,25,39,0.29);stop-opacity:0.5" />
        </linearGradient>
        <linearGradient id="br-one-lrt-defs" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:rgba(12,25,39,0.29);stop-opacity:0.5" />
            <stop offset="100%" style="stop-color:#7FBEF7;stop-opacity:1" />
        </linearGradient>
        <!-- ball -->
        <radialGradient id="ball" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" style="stop-color:#0047FD;" />
            <stop offset="100%" style="stop-color: #5B8BB7;" />
        </radialGradient>
        <filter id="ball-shadow" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="0" flood-color="#75b7f9">
                <animate attributeName='stdDeviation' dur='3s' values="15;5;15" repeatCount="indefinite" />
            </feDropShadow>
        </filter>
        <!-- branch two -->
        <linearGradient id="br-two-t-defs" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#3CA1FF;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#2E4A67;stop-opacity:0.5" />
        </linearGradient>
        <linearGradient id="br-two-b-defs" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#2E4A67;stop-opacity:0.5" />
            <stop offset="100%" style="stop-color:#3CA1FF;stop-opacity:1" />
        </linearGradient>
        <!-- branch three -->
        <linearGradient id="br-three-lt-defs" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#7FBEF7;stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgba(12,25,39,0.23);stop-opacity:1" />
        </linearGradient>
        <linearGradient id="br-three-rt-defs" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:rgba(12,25,39,0.23);stop-opacity:1" />
            <stop offset="100%" style="stop-color:#7FBEF7;stop-opacity:1" />
        </linearGradient>

        <!-- 高亮polygon  #658DF5（深） #D6EBFF（浅） -->
        <linearGradient id="br-three-lt-light-defs" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#658DF5;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#D6EBFF;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="br-three-rt-light-defs" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#D6EBFF;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#658DF5;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="br-two-t-light-defs" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#D6EBFF;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#658DF5;stop-opacity:0.5" />
        </linearGradient>
        <linearGradient id="br-two-b-light-defs" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#658DF5;stop-opacity:0.5" />
            <stop offset="100%" style="stop-color:#D6EBFF;stop-opacity:1" />
        </linearGradient>
        <filter id="text-shadow" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="0" flood-color="#ffffff">
                <animate attributeName='stdDeviation' dur='3s' values="3;0;3" repeatCount="indefinite" />
            </feDropShadow>
        </filter>
    </defs>
</template>

<script setup></script>