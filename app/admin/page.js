"use client";
import AdminContainer from '@/components/admin/AdminContainer';
import React, { Suspense } from 'react'

function page() {
  return (
   <Suspense>
    <AdminContainer />
   </Suspense>
  )
}

export default page