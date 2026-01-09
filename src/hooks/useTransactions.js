import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

export function useTransactions(userId) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setTransactions([])
      setLoading(false)
      return
    }

    fetchTransactions()

    // S'abonner aux changements en temps réel
    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchTransactions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTransaction = async (transaction) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transaction, user_id: userId }])
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error adding transaction:', error)
      throw error
    }
  }

  const deleteTransaction = async (id) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting transaction:', error)
      throw error
    }
  }

  return {
    transactions,
    loading,
    addTransaction,
    deleteTransaction,
    refresh: fetchTransactions,
  }
}
